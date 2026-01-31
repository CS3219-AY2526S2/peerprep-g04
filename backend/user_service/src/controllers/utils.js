export function hash_password(password) {
    return password;
}

export function compare_password(password, password_hash) {
    return hash_password(password) === password_hash;
}

export function format_user(user) {
    return {
        user_id: user.id,
        username: user.username,
        email: user.email,
        access: user.access,
    }
}