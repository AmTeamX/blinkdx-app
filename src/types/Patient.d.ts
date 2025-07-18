import { Video } from './types';

export interface Patient {
    id: number;
    researchID: string;
    name: string | null;
    age: number | null;
    gender: string | null;
    condition: string | null;
    createdDatetime: string;
    videos?: Video[];
}
