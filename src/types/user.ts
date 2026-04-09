export type UserRole = 'student' | 'doctor';
export type UserGender = 'male' | 'female' | 'other' | 'prefer_not_to_say';

export interface BaseUser {
    name: string;
    email: string;
    password: string;
    phone: string;
    cpf: string;
    birthDate: string;
    gender: UserGender;
    photoURL?: string;
    observations?: string;
}

export interface StudentUser extends BaseUser {
    role: 'student';
    institution: string;
    coursePeriod: number;
    specializations?: string;
}

export interface DoctorUser extends BaseUser {
    role: 'doctor';
    institutions: string;
    crm: string;
    hasMasters: boolean;
    mastersArea?: string;
    mastersInstitution?: string;
    hasPhd: boolean;
    phdArea?: string;
    phdInstitution?: string;
    hasPostGrad: boolean;
    postGradArea?: string;
    postGradInstitution?: string;
}