import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as argon from 'argon2';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import {
  SigninDto,
  SignupDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from 'src/dto';
import { EmailService } from '../email/email.service';
import { ProfileLinkGenerator } from '../user/profileSlugOrLink.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private readonly emailservice: EmailService,
    private readonly plg: ProfileLinkGenerator,
  ) {}

  /**
   * Signs up a new user.
   * @param {SignupDto} dto - The signup data transfer object.
   * @returns {Promise<Object>} - The response object containing the signup details.
   * @throws {BadRequestException} - If passwords do not match.
   * @throws {ConflictException} - If credentials already exist.
   */
  async signup(dto: SignupDto) {
    try {
      if (dto.password !== dto.confirmPassword) {
        throw new BadRequestException('Passwords do not match!');
      }
      dto.password = await argon.hash(dto.password);
      // Generate unique profile link
      const profileSlugOrLink = await this.plg.generate(dto.username);

      const user = this.userRepo.create({
        ...dto,
        profileSlugOrLink,
      });
      await this.userRepo.save(user);

      const token = await this.signToken(user.id, user.email);
      await this.emailservice.sendWelcomeMail(user);
      return { message: 'Successfully signed up', token };
    } catch (e) {
      if (e.code === '23505') {
        throw new ConflictException('Credentials alredy exists!');
      }
      throw e;
    }
  }

  /**
   * Signs in a user.
   * @param {SigninDto} dto - The signin data transfer object.
   * @returns {Promise<Object>} - The response object containing the signin details.
   * @throws {NotFoundException} - If credentials are incorrect.
   */
  async signin({ email, password }: SigninDto) {
    try {
      const user = await this.userRepo.findOne({ where: { email } });
      if (!user) throw new NotFoundException('Credentials incorrect');

      const validPassword = await argon.verify(user.password, password);
      if (!validPassword) throw new NotFoundException('Credentials incorrect');
      const token = await this.signToken(user.id, user.email);
      return { message: 'Successfully signed in', token };
    } catch (e) {
      throw e;
    }
  }

  /**
   * Initiates the forgot password process.
   * @param {ForgotPasswordDto} dto - The forgot password data transfer object.
   * @returns {Promise<void>}
   * @throws {NotFoundException} - If credentials are incorrect.
   */
  async forgotPassword({ email }: ForgotPasswordDto): Promise<void> {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) throw new NotFoundException('credentials incorrect');

    // Generate reset token
    const resetToken = await this.jwt.signAsync(
      { sub: user.id, email: user.email },
      {
        expiresIn: '30m',
        secret: this.config.get('JWT_RESET_SECRET'),
      },
    );

    // Save reset token to user entity
    user.resetToken = resetToken;
    user.resetTokenExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now
    await this.userRepo.save(user);

    // Send email with reset link
    const resetLink = `http://localhost:3000/reset-password/${resetToken}`;

    // Implement email sending logic
    await this.emailservice.sendResetPasswordMail(user, resetLink);
    console.log(resetLink);
  }

  /**
   * Resets the user's password.
   * @param {ResetPasswordDto} dto - The reset password data transfer object.
   * @returns {Promise<Object>} - The response object containing the reset password details.
   * @throws {NotFoundException} - If credentials are incorrect.
   * @throws {UnauthorizedException} - If the reset token has expired.
   */
  async resetPassword({ token, newPassword }: ResetPasswordDto) {
    try {
      // Verify the token
      const decoded = this.jwt.verify(token, {
        secret: this.config.get('JWT_RESET_SECRET'),
      });

      // Check if the token is valid (email)
      const user = await this.userRepo.findOne({
        where: { email: decoded.email },
      });

      if (!user) throw new NotFoundException('Credentials incorrect');

      user.password = await argon.hash(newPassword);
      await this.userRepo.save(user);

      return { message: 'Successfully reset password' };
    } catch (e) {
      if (e instanceof TokenExpiredError) {
        throw new UnauthorizedException('Reset token has expired');
      }
      throw new Error(e);
    }
  }

  /**
   * Signs a JWT token for the user.
   * @param {string} userId - The ID of the user.
   * @param {string} email - The email of the user.
   * @returns {Promise<Object>} - The response object containing the access and refresh tokens.
   */
  async signToken(
    userId: string,
    email: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const payload = {
      sub: userId,
      email,
    };
    const accessToken = await this.jwt.signAsync(payload, {
      expiresIn: '10m',
      secret: this.config.get('JWT_ACCESS_SECRET'),
    });

    const refreshToken = await this.jwt.signAsync(payload, {
      expiresIn: '1d',
      secret: this.config.get('JWT_REFRESH_SECRET'),
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  /**
   * Refreshes the JWT token.
   * @param {string} token - The refresh token.
   * @returns {Promise<Object>} - The response object containing the new access and refresh tokens.
   * @throws {UnauthorizedException} - If the refresh token is invalid.
   */
  async refreshToken(
    token: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    try {
      const payload = await this.jwt.verifyAsync(token, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
      });

      const user = await this.userRepo.findOne({ where: { id: payload.sub } });
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return this.signToken(user.id, user.email);
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token', e);
    }
  }

  // async logout(token: string) {
  //   // Implement token blacklist logic
  //   return { message: 'Successfully logged out' };
  // }
}
