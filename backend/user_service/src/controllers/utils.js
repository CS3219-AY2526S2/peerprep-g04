import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 1;

export function hash_password(password) {
    const res = bcrypt.hashSync(password, SALT_ROUNDS);
    return res;
}

export function compare_password(password, password_hash) {
    return bcrypt.compareSync(password, password_hash);
}

export function format_user(user) {
    return {
        user_id: user.id,
        username: user.username,
        email: user.email,
        access: user.access,
    }
}