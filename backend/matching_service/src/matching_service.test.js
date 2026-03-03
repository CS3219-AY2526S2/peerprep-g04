import { test, expect } from 'vitest';
import { MatchingService, states } from './matching_service';

test('test 1 person', async () => {
    const matching_service = new MatchingService();
    
    const res1 = await matching_service.register('tom');
    expect(res1.state).toBe(states.register);

    const res2 = await matching_service.request_match('tom', { difficulties: ['easy'], tags: ['array'] });
    expect(res2.state).toBe(states.matching);

    const res3 = await matching_service.leave('tom');
    const res4 = await matching_service.register('tom');
    expect(res4.state).toBe(states.register);
})

test('test 2 person', async () => {
    const matching_service = new MatchingService();
    const req = { difficulties: ['easy'], tags: ['array'] };
    
    const res1 = await matching_service.register('tom');
    expect(res1.state).toBe(states.register);

    const res2 = await matching_service.request_match('tom', req);
    expect(res2.state).toBe(states.matching);

    const res3 = await matching_service.register('jim');
    expect(res3.state).toBe(states.register);

    const res4 = await matching_service.request_match('jim', req);
    expect(res4.state).toBe(states.matched);

    await matching_service.disconnect('tom');
    const res6 = await matching_service.register('tom');
    expect(res6.state).toBe(states.matched);


})