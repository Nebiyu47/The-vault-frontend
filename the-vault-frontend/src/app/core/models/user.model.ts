import { NumberValueAccessor } from "@angular/forms";

export interface User{
    id: string;
    username: string;
    email: string;
    fullname?:string;
    avatarUrl?:string;
    role:'ARCHITECT' | 'BREACHER' | 'ADMIN';
    isVerified: boolean;
    vaultPoints: number;
    totalWins: number;
    winGames:number;
    winRate:number;
    createdAt:Date;
    lastLogin?:Date;
    preferences?:UserPreferences;

}
export interface UserPreferences{
    them?: 'dark' | 'light'
    soundEnabled? :boolean;
    notificationsEnabled?:boolean;
    language?:string;
}
export interface LoginRequest {
    usernameOrEmail: string;
    password:string;
    rememberMe?:boolean
}
export interface RegisterRequest {
    email : string;
    username: string ;
    password : string ;
    fullName?: string ;
    role? : string;
}
export interface AuthResponse {
    userId: string;
    username: string;
    email : string;
    role: string;
    accessToken: string;
    refreshToken: string;
    expiresIn : number;
    tokenType: string;
}
export interface PasswordResetRequest{
    email : string
}
export interface PasswordResetConfirm{
    token: string;
    newPassword: string;
}