
export function get_req_intersection(req1, req2) {
    const diff_set1 = new Set(req1.difficulties);
    const tags_set1 = new Set(req1.tags);
    const diff_set2 = new Set(req2.difficulties);
    const tags_set2 = new Set(req2.tags); 

    return {
        difficulties: [...diff_set1.intersection(diff_set2)],
        tags: [...tags_set1.intersection(tags_set2)],
    }
}

export function has_req_intersection(req1, req2) {
    const { difficulties, tags } = get_req_intersection(req1, req2);
    return difficulties.length > 0 && tags.length > 0;
}

// must complete within 50ms, else return a dummy question.
export async function get_question(req) {
    return {
        title: 'two sum',
        difficulty: 'easy',
        tags: ['array'],
        body: ['hello world'],
    }
}
