---
to: packages/<%= name.split("/")[1] %>/src/<%= h.changeCase.pascal(name.split("/")[1]) %>.mdx
---
<%
  const packageName = name.split("/")[1];
  const ComponentName = h.changeCase.pascal(packageName);
%>
import { Canvas, Meta } from '@storybook/blocks';
import * as <%= ComponentName %>Stories from './<%= ComponentName %>.stories';

<Meta title="Components/<%= ComponentName %>" />

# <%= ComponentName %>

<% ["CustomName", "LongName"].forEach((story) => {%>
## <%= story %>
<Canvas of={<%= ComponentName %>Stories.<%= story %>} />

<% }) %>
