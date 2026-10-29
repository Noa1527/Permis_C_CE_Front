
export enum Role {
    Admin = 'admin',
    User = 'user',
}

export interface User {
    _id?: string;
    email: string;
    role: Role;
    firstName: string;
    lastName: string;
    password?: string;
    createdAt?: Date;
}

export type Users = User[];


export interface FindUserQuery {
    search?: string;
}

export class FindUserDto {
    query?: FindUserQuery;

    constructor(
        query?: FindUserQuery,
    ) {

        this.query = query;
        //  else {
        //     this.pagination = new FindEsgPaginationDto();
        // }
    }
}

// UpdateUser

export interface UpdateUser {
    firstName: string;
    lastName: string;
}
