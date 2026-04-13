import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 4;

export async function hash_password(password) {
    return await bcrypt.hash(password, SALT_ROUNDS);
}

export async function compare_password(password, password_hash) {
    return await bcrypt.compare(password, password_hash);
}

export function format_user(user) {
    return {
        user_id: user.id,
        username: user.username,
        email: user.email,
        access: user.access,
    }
}