import Link from 'next/link';

function MyApp({ Component, pageProps }) {
  return (
    <div>
      <nav>
        <ul>
          <li>
            <Link href="/quiz">
              <a>Quiz</a>
            </Link>
          </li>
          <li>
            <Link href="/participate">
              <a>Participate</a>
            </Link>
          </li>
        </ul>
      </nav>
      <Component {...pageProps} />
    </div>
  );
}

export default MyApp;
