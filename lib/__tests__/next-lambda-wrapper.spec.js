import { NextLambdaWrapper } from "../../dist/next-wrapper";
import next from 'next';
import * as serverlessHttp from 'serverless-http';

jest.mock('next');
jest.mock('serverless-http');

describe("next-lambda-wrapper", () => {
  it("should return a handler function", () => {
      next.mockImplementation(()=>{
          return {
            prepare: jest.fn(()=>(Promise.resolve(true))),
            getRequestHandler: jest.fn(()=>(true))
          }          
      });
      
      const actual = NextLambdaWrapper('test-dir');
      expect(next.mock.calls.length).toBe(1);
      expect(next.mock.calls[0][0]).toEqual({dir: 'test-dir'});
      expect(typeof actual).toBe('function');
  });

  describe('returned handler', ()=> {
      it('should initialize only once, and serverless Handler called', async ()=>{
        const prepareMockFn = jest.fn(()=>(Promise.resolve(true)));
        const getRequestHandlerMockFn = jest.fn(()=>(true));
        const slsHandlerMockFn = jest.fn(()=>(Promise.resolve(true)));
        next.mockImplementation(()=>{
            return {
              prepare: prepareMockFn,
              getRequestHandler: getRequestHandlerMockFn
            }          
        });
        serverlessHttp.mockImplementation(()=>(slsHandlerMockFn));  
        const handler = NextLambdaWrapper('test-dir');          
        await handler({},{});
        await handler({},{});
        expect(prepareMockFn.mock.calls.length).toBe(1);
        expect(getRequestHandlerMockFn.mock.calls.length).toBe(1);
        expect(serverlessHttp.mock.calls.length).toBe(1);
        expect(serverlessHttp.mock.calls[0][0].handle).toBeDefined();
        expect(slsHandlerMockFn.mock.calls.length).toBe(2);
      });
  });
});
