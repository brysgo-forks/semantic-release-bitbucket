import btoa from 'btoa';
import fetch from 'node-fetch';

import SemanticReleaseConfig from '../@types/SemanticReleaseConfig';
import SemanticReleaseContext from '../@types/SemanticReleaseContext';
import { BitbucketPublishConfig } from '../bitbucketPlugnConfig';

export async function verifyConditions(pluginConfig: SemanticReleaseConfig,
                                       context: SemanticReleaseContext): Promise<boolean> {
  if (!process.env.BITBUCKET_USER) {
    throw new Error('Environment variable BITBUCKET_USER is not set.');
  }
  if (!process.env.BITBUCKET_PASSWORD) {
    throw new Error('Environment variable BITBUCKET_PASSWORD is not set.');
  }
  if (!(context.options.publish &&
        context.options.publish.find((p) => p.path === '@brysgo/semantic-release-bitbucket'))) {
          throw new Error('\'publish\' key is not configured');
  }
  const bitbucketPlugnConfig = context.options.publish!
    .find((p) => p.path === '@brysgo/semantic-release-bitbucket')! as BitbucketPublishConfig;
  if (!bitbucketPlugnConfig.repositoryName) {
    throw new Error('\'repositoryName\' must be set in the publish config section.');
  }
  const encodedCreds = btoa(`${process.env.BITBUCKET_USER}:${process.env.BITBUCKET_PASSWORD}`);
  const bitbucketUrl = bitbucketPlugnConfig.bitbucketUrl ?
    bitbucketPlugnConfig.bitbucketUrl.endsWith('/') ? bitbucketPlugnConfig.bitbucketUrl :
      `${bitbucketPlugnConfig.bitbucketUrl}/` : 'https://api.bitbucket.org/2.0/';
  const scope = bitbucketPlugnConfig.teamName ? bitbucketPlugnConfig.teamName : process.env.BITBUCKET_USER;
  if(bitbucketUrl.includes('https://api.bitbucket.org/2.0/')){
    var repoUrl = `${bitbucketUrl}repositories/${owner}/${pluginConfig.repositoryName}`;
  } else {
    var repoUrl = `${bitbucketUrl}${owner}/repos/${pluginConfig.repositoryName}`;
  }
  return fetch(repoUrl, {
      headers: {Authorization: `Basic ${encodedCreds}`},
    })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error(`${response.status} ${response.statusText}`);
      }
    })
    .then((data) => {
      return true;
    })
    .catch((error) => {
      throw new Error(error);
    });
}
