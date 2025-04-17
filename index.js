
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const server = new McpServer({ name: 'AddServer', version: '1.0.0' });
// 1. 'add'라는 이름의 도구(tool)를 MCP 서버에 등록합니다.
server.tool(
    // 도구 이름
    'add',
  
    // 2. 이 도구가 요구하는 입력 파라미터의 스키마 정의 (여기선 숫자 a와 b)
    {
      a: z.number(), // zod 라이브러리를 사용하여 a는 숫자여야 함
      b: z.number(), // b도 숫자여야 함
    },
  
    // 3. 실제 처리 함수: 사용자가 도구를 호출하면 실행되는 비동기 함수
    async ({ a, b }) => {
      // a와 b를 더해서 문자열로 바꾸고, 결과를 content 형식으로 반환
      return {
        content: [
          {
            type: 'text',      // 응답 유형은 텍스트
            text: String(a + b) // 더한 값을 문자열로 변환하여 응답
          }
        ]
      };
    }
  );
  

  
const transport = new StdioServerTransport();
await server.connect(transport);