import {  APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyStructuredResultV2, Context} from 'aws-lambda';
import * as serverlessHttp from 'serverless-http';
import next from 'next';
import { IncomingMessage, ServerResponse } from 'node:http';

type WrapperFn = (event: APIGatewayProxyEvent, context: Context) => Promise<APIGatewayProxyResult | APIGatewayProxyStructuredResultV2>;
export const NextLambdaWrapper = (nextProjectRoot: string):WrapperFn => {  
  const nextApp = next({ dir: nextProjectRoot });  
  let requestHandler:ReturnType<typeof nextApp.getRequestHandler>;
  let slsHandler:serverlessHttp.Handler;
  const wrappedHandler = async (event: APIGatewayProxyEvent, context: Context) => {
    if (!slsHandler) {
      await nextApp.prepare();
      requestHandler = nextApp.getRequestHandler();
      const app = {
        handle: (request: IncomingMessage, response: ServerResponse) => requestHandler(request, response)      
      }
      slsHandler = serverlessHttp(app);
    }
    return await slsHandler(event, context)
  }
  return wrappedHandler;
}