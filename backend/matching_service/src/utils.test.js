import { test, expect } from "vitest";
import { get_req_intersection, has_req_intersection } from "./utils"

test('get req intersection', () => {
    const r1 = {
        difficulties: ['easy', 'hard'],
        tags: ['pq', 'dp'],
    }

    const r2 = {
        difficulties: ['easy', 'medium'],
        tags: ['pq', 'tree'],
    }

    const res = get_req_intersection(r1, r2);
    expect(res).toMatchObject({
        difficulties: ['easy'],
        tags: ['pq'],
    })
})

test('has req intersection', () => {
    const r1 = {
        difficulties: ['easy', 'hard'],
        tags: ['pq', 'dp'],
    }

    const r2 = {
        difficulties: ['easy', 'medium'],
        tags: ['pq', 'tree'],
    }

    const res = has_req_intersection(r1, r2);
    expect(res).toBeTruthy();

    const r3 = {
        difficulties: ['medium'],
        tags: ['dp'],
    }

    const res2 = has_req_intersection(r1, r3);
    expect(res2).toBeFalsy();

})