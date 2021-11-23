import { IUser } from "@codelabeller/api-interfaces";

export interface UserAuthProvider {
  getUserFromEmail(email: string): Promise<IUser>;
  createUser(newUser: IUser): Promise<IUser>;
  updateLastSeen(email: string): Promise<void>;
  areUnlistedUsersAllowed(): Promise<boolean>;
}
