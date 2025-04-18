import * as z from 'zod';

export const UserValidation = z.object({
    profile_photo: z.string().url().nonempty(),
    name: z.string().min(3, {message: 'Minimum 3 characters'}).max(50),
    username: z.string().min(3, {message: 'Minimum 3 characters'}).max(50),
    bio: z.string().min(3, {message: 'Minimum 3 characters'}).max(1000),
});