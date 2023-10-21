type Inner2Outer =
  <T1 extends string, T2 extends string, TV>(input: { [k in T1]: { [k in T2]: TV } }) =>
    { [k in T2]: { [k in T1]: TV } }

export const foldInner2Outer =
  (<T1 extends string, T2 extends string, TV>(input: { [k in T1]: { [k in T2]: TV } }) =>
    Object.entries(input)
      .reduce(
        // @ts-ignore
        (prev, cur: [string, { [k in T2]: TV }]) => {
          const t = ({
            ...prev,
            ...(Object.fromEntries(
              Object.keys(cur[1]).map(k2 =>
                // @ts-ignore
                [k2, {...(prev[k2] || {}), [cur[0]]: cur[1][k2] as TV}]
              )
            ))
          })
          return t as { [k in T2]: { [k in T1]: TV } }
        }, {} as { [k in T2]: { [k in T1]: TV } })) as unknown as Inner2Outer
