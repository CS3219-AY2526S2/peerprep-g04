export function goBack(path, navigate) {
    const segments = path.split('/');
    segments.pop();
    navigate(segments.join('/'));
};