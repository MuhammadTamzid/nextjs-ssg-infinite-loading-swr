import Head from 'next/head'
import { useState, useEffect, useRef } from "react"
import { useSWRInfinite } from "swr";
import useOnScreen from "../hooks/useOnScreen"

const PER_PAGE = 20;
const fetcher = url => fetch(url).then(res => res.json());

export default function Home({ initIssues }) {
    const ref = useRef()
    const isVisible = useOnScreen(ref)
    
    const { data, error, size, setSize, isValidating } = useSWRInfinite(
        index => `https://api.github.com/repos/vercel/next.js/issues?per_page=${PER_PAGE}&page=${index + 1}`,
        fetcher, {initialData: initIssues, revalidateOnMount: true}
    );

    const issues = data ? [].concat(...data) : [];
    const isLoadingInitialData = !data && !error;
    const isLoadingMore =
        isLoadingInitialData ||
        (size > 0 && data && typeof data[size - 1] === "undefined");
    const isEmpty = data?.[0]?.length === 0;
    const isReachingEnd =
        isEmpty || (data && data[data.length - 1]?.length < PER_PAGE);
    const isRefreshing = isValidating && data && data.length === size;
    
    useEffect(() => {
        if (isVisible && !isReachingEnd && !isRefreshing) {
            setSize(size + 1)
        }
    }, [isVisible, isRefreshing])

  return (
      <div>
          <Head>
              <title>Nextjs SSG + Infinite Loading SWR</title>
              <link rel="icon" href="/favicon.ico" />
          </Head>
          
          <h1>Nextjs SSG + Infinite Loading SWR</h1>
          <hr/>
        
          <main>
              {isEmpty ? <p>No issues found.</p> : null}
              {issues.map(issue => {
                  return (
                      <p key={issue.id} style={{ margin: "20px 0", fontSize: "20px" }}>
                        {issue.id} - {issue.title}
                      </p>
                  );
              })}
          
              <div ref={ref}>
                  {isLoadingMore ? (
                      <p>Loading</p>
                  ) : (
                      ""
                  )}
              </div>
              
              {/*Load more Button*/}
              {/*{isReachingEnd ? (*/}
              {/*    ""*/}
              {/*) : (*/}
              {/*    <div style={{ margin: "20px 0px" }}>*/}
              {/*        <button onClick={() => setSize(size + 1)}>Load more</button>*/}
              {/*    </div>*/}
              {/*)}*/}
          </main>
      </div>
  )
}

export async function getStaticProps() {
    const url = `https://api.github.com/repos/vercel/next.js/issues?per_page=${PER_PAGE}&page=1`
    const res = await fetch(url)
    const issues = await res.json()

    return {
        props: {
            issues
        },
        revalidate: 60
    }
}
