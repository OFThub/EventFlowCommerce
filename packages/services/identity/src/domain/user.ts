export interface User {
  id: string;
  email: string;
  passwordHash: string;
  roles: string[];
  createdAt: string;
  updatedAt: string;
}

export class UserAggregate {
  constructor(
    public readonly id: string,
    public email: string,
    public passwordHash: string,
    public roles: string[],
    public createdAt: string,
    public updatedAt: string
  ) {}

  static create(id: string, email: string, passwordHash: string): UserAggregate {
    const now = new Date().toISOString();
    return new UserAggregate(id, email, passwordHash, ['customer'], now, now);
  }

  updatePassword(newPasswordHash: string): void {
    this.passwordHash = newPasswordHash;
    this.updatedAt = new Date().toISOString();
  }

  addRole(role: string): void {
    if (!this.roles.includes(role)) {
      this.roles.push(role);
      this.updatedAt = new Date().toISOString();
    }
  }

  toDTO(): User {
    return {
      id: this.id,
      email: this.email,
      passwordHash: this.passwordHash,
      roles: this.roles,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}