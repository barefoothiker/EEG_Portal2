export class User {
    id: string;
    email: string;
    username:string;
    firstName: string;
    lastName: string;
    addressLine1:string;
    addressLine2:string;
    city:string;
    state:string;
    zipCode:string;
    phoneNumber:string;
}

export class UserUpdateObj {
    user: User;
    message: string;
}
