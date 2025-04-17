// MCP Server using TypeScript SDK - Document Approval Workflow

import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "approval-workflow-server",
  version: "1.0.0"
});

const approvals = new Map(); // 타입 생략

// Tool: Submit Document
server.tool(
  "submit_document",
  {
    name: z.string(),
    type: z.enum(["보고서", "회의록", "검토요청"]),
    content: z.string()
  },
  async ({ name, type, content }) => {
    const docId = `doc-${Date.now()}`;
    approvals.set(docId, "pending");
    return {
      content: [{ type: "text", text: `문서 ${docId} 제출 완료. 승인 대기 중입니다.` }]
    };
  }
);

// Tool: Check Approval Status
server.tool(
  "check_approval_status",
  { document_id: z.string() },
  async ({ document_id }) => {
    const status = approvals.get(document_id) ?? "not_found";
    return {
      content: [{ type: "text", text: `상태: ${status}` }]
    };
  }
);

// Tool: Approve Document (by reviewer)
server.tool(
  "approve_document",
  { document_id: z.string() },
  async ({ document_id }) => {
    approvals.set(document_id, "approved");
    return {
      content: [{ type: "text", text: `${document_id} 문서가 승인되었습니다.` }]
    };
  }
);

// Tool: Auto-deploy if approved
server.tool(
  "auto_deploy_if_approved",
  { document_id: z.string() },
  async ({ document_id }) => {
    const status = approvals.get(document_id);
    if (status === "approved") {
      return {
        content: [{ type: "text", text: `✅ 문서 ${document_id} 배포 완료.` }]
      };
    } else {
      return {
        content: [{ type: "text", text: `⏳ 문서 ${document_id}는 아직 승인되지 않았습니다.` }]
      };
    }
  }
);

// Resource: Document Format Template
server.resource(
  "meeting-doc-template",
  new ResourceTemplate("format://meeting-doc", { list: undefined }),
  async (uri) => ({
    contents: [
      {
        uri: uri.href,
        text: `회의록 양식\n- 회의 제목\n- 참석자\n- 논의 내용\n- Action Items`
      }
    ]
  })
);

// Resource: Workflow Description
server.resource(
  "approval-workflow",
  new ResourceTemplate("workflow://approval-step", { list: undefined }),
  async (uri) => ({
    contents: [
      {
        uri: uri.href,
        text: `A사 업무 승인 프로세스\n1. 작성자 제출\n2. CTO 승인\n3. 배포\n4. 완료 로그 작성`
      }
    ]
  })
);

// Connect to stdio transport
const transport = new StdioServerTransport();
await server.connect(transport);
