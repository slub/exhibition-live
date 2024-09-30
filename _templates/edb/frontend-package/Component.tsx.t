---
to: packages/<%= name.split("/")[1] %>/src/<%= h.changeCase.pascal( name.split("/")[1] ) %>.tsx
---
<%
  const packageName = name.split("/")[1];
  const ComponentName = h.changeCase.pascal(packageName);
%>
import React, {FunctionComponent} from 'react';

export type <%= ComponentName %>Props = {
  name: string;
};
export const <%= ComponentName %>: FunctionComponent<<%= ComponentName %>Props> = ({ name }) => {
  return <div>Hello {name} from <%= name %> Package!</div>;
}
