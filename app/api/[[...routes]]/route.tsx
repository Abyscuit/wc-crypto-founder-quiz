/** @jsxImportSource frog/jsx */

import { Button, Frog } from 'frog';
import { devtools } from 'frog/dev';
// import { neynar } from 'frog/hubs'
import { handle } from 'frog/next';
import { serveStatic } from 'frog/serve-static';
import { bg, container, fontStyle } from '../styles/styles';
import { Roboto } from '../styles/fonts';

const app = new Frog({
  assetsPath: '/',
  basePath: '/api',
  // Supply a Hub to enable frame verification.
  // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' })
  title: 'Which crypto founder are you?',
  imageOptions: {
    // @ts-ignore
    fonts: [...Roboto],
  },
});

const questions = [
  {
    question: 'Which wallet do you hold your crypto in?',
    answers: [
      { answer: 'Exchange', weight: '0' },
      { answer: 'Private', weight: '1' },
      { answer: 'Hardware', weight: '2' },
    ],
  },
  {
    question: 'Do you use DeFi lending?',
    answers: [
      { answer: 'Always', weight: '0' },
      { answer: 'Never', weight: '1' },
      { answer: 'Only Supply', weight: '2' },
    ],
  },
  {
    question: 'Which best describes crypto?',
    answers: [
      { answer: 'Black Box', weight: '0' },
      { answer: 'Money', weight: '1' },
      { answer: 'Transparent', weight: '2' },
    ],
  },
  {
    question: 'Have you ever traded crypto on leverage?',
    answers: [
      { answer: 'Absolutely', weight: '0' },
      { answer: 'What??', weight: '1' },
      { answer: 'Nope. Never', weight: '2' },
    ],
  },
  {
    question: 'Are you currently staking any crypto?',
    answers: [
      { answer: 'Maybe?', weight: '0' },
      { answer: 'No', weight: '1' },
      { answer: 'Yes', weight: '2' },
    ],
  },
];
const founders = [
  {
    name: 'Sam Bankman-Fried',
    desc: "It's giving fun to be around.",
    crypto: 'crypto',
  },
  {
    name: 'Do Kwon',
    desc: 'Not afraid to embrace your silly side!',
    crypto: 'crypto',
  },
  {
    name: 'CZ',
    desc: 'You adapt to challenges and are not afraid to try new things.',
    crypto: 'BNB',
  },
  {
    name: 'Vitalik Buterin',
    desc: 'A reliable leader, the people love you!',
    crypto: 'Ethereum',
  },
  {
    name: 'Satoshi Nakamoto',
    desc: 'Basically very based.',
    crypto: 'Bitcoin',
  },
];
const enkryptDesc =
  'Easily manage your {crypto} with our multichain browser wallet Enkrypt!';

let storedAnswers: number[] = [];
let questionNum = 0;

app.frame('/', c => {
  return c.res({
    image: (
      <div style={container}>
        <img
          alt='background'
          src='/background.png'
          width={'100%'}
          height={'100%'}
          style={bg}
        />
        <div style={fontStyle}>{app.title}</div>
      </div>
    ),
    intents: [
      <Button value='reset' action='/questions'>
        Let's find out!
      </Button>,
    ],
  });
});
function incrementQuestion(value: string) {
  questionNum++;
  if (value !== 'reset') storedAnswers.push(parseInt(value));
}
app.frame('/questions', c => {
  const { buttonValue } = c;
  if (buttonValue === 'reset') {
    storedAnswers.splice(0, storedAnswers.length);
    questionNum = 0;
  }
  const lastQuestion = questionNum === questions.length - 1;
  const linkAction = lastQuestion ? '/result' : '';
  const currentQuestion = questions[questionNum];
  const [answer1, answer2, answer3] = currentQuestion.answers;
  return c.res({
    image: (
      <div style={container}>
        <img
          alt='background'
          src='/background.png'
          width={'100%'}
          height={'100%'}
          style={bg}
        />
        {incrementQuestion(buttonValue ?? '')}
        <div style={fontStyle}>{currentQuestion.question}</div>
      </div>
    ),
    intents: [
      <Button value={answer1.weight} action={linkAction}>
        {answer1.answer}
      </Button>,
      <Button value={answer2.weight} action={linkAction}>
        {answer2.answer}
      </Button>,
      <Button value={answer3.weight} action={linkAction}>
        {answer3.answer}
      </Button>,
      <Button.Reset>Start Over</Button.Reset>,
    ],
  });
});

app.frame('/result', c => {
  const { buttonValue } = c;
  if (buttonValue && !isNaN(parseInt(buttonValue))) {
    storedAnswers.push(parseInt(buttonValue));
  }
  const result = calculateResult();
  const founder = founders[result];
  const founderImg = `${founder.name.replace(' ', '-')}.png`;
  return c.res({
    image: (
      <div style={{ ...container, flexDirection: 'row' }}>
        <img
          alt='background'
          src='/background.png'
          width={'100%'}
          height={'100%'}
          style={bg}
        />
        <img
          src={`/images/${founderImg}`}
          width={380}
          height={380}
          alt={`${founder.name}`}
        />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignText: 'center',
            alignItems: 'center',
            justifyContent: 'center',
            width: '60%',
          }}
        >
          <div style={{ ...fontStyle, fontSize: 45 }}>{`You are ${
            founder.name
          }.\n${founder.desc}\n${enkryptDesc.replace(
            '{crypto}',
            founder.crypto
          )}`}</div>
        </div>
      </div>
    ),
    intents: [
      <Button.Link href='https://chrome.google.com/webstore/detail/enkrypt/kkpllkodjeloidieedojogacfhpaihoh'>
        Download Enkrypt
      </Button.Link>,
      <Button.Reset>Start Over</Button.Reset>,
    ],
  });
});

function calculateResult(): number {
  let sum = 0;
  for (const element of storedAnswers) {
    sum += element;
  }
  sum = Math.floor(sum / 2);
  if (sum > founders.length - 1) sum = founders.length - 1;
  return sum;
}

devtools(app, { serveStatic });

export const GET = handle(app);
export const POST = handle(app);

// NOTE: That if you are using the devtools and enable Edge Runtime, you will need to copy the devtools
// static assets to the public folder. You can do this by adding a script to your package.json:
// ```json
// {
//   scripts: {
//     "copy-static": "cp -r ./node_modules/frog/_lib/ui/.frog ./public/.frog"
//   }
// }
// ```
// Next, you'll want to set up the devtools to use the correct assets path:
// ```ts
// devtools(app, { assetsPath: '/.frog' })
// ```
