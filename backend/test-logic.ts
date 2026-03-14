import { runAnalystAgent } from './src/services/agents/analyst.agent';
import { runStoryWriterAgent } from './src/services/agents/storyWriter.agent';

async function main() {
  console.log('Testing Analyst Agent...');
  const brd = await runAnalystAgent([
    "Users complain the graph is moving too fast.",
    "I want a way to pause the live updates.",
    "It's hard to read the node names when it's moving."
  ]);
  
  console.log('\nAnalyst Agent Result (BRD):');
  console.log(JSON.stringify(brd, null, 2));

  console.log('\nTesting Story Writer Agent...');
  const stories = await runStoryWriterAgent(brd);
  
  console.log('\nStory Writer Agent Result:');
  console.log(JSON.stringify(stories, null, 2));
}

main().catch(console.error);
