import { useCallback, useState, useEffect } from 'react';
import { AppExtensionSDK } from '@contentful/app-sdk';
import {
  Heading,
  Workbench,
  Paragraph,
  WorkbenchContent,
  Typography,
} from '@contentful/forma-36-react-components';
import { css } from 'emotion';

export interface AppInstallationParameters {}

interface ConfigProps {
  sdk: AppExtensionSDK;
}

const Config = (props: ConfigProps) => {
  const [parameters, setParameters] = useState<AppInstallationParameters>({});

  const onConfigure = useCallback(async () => {
    const currentState = await props.sdk.app.getCurrentState();

    return {
      parameters,
      targetState: currentState,
    };
  }, [parameters, props.sdk]);

  useEffect(() => {
    props.sdk.app.onConfigure(() => onConfigure());
  }, [props.sdk, onConfigure]);

  useEffect(() => {
    (async () => {
      const currentParameters: AppInstallationParameters | null =
        await props.sdk.app.getParameters();

      if (currentParameters) {
        setParameters(currentParameters);
      }

      props.sdk.app.setReady();
    })();
  }, [props.sdk]);

  return (
    <Workbench className={css({ margin: '80px' })}>
      <WorkbenchContent type="text">
        <Typography>
          <Heading>References with DAM support</Heading>
          <Paragraph>
            As its name hopefully communicates, the &quot;References with DAM
            support&quot; app extends the reference fields in Contentful to
            enable a quick preview of DAM assets directly from the references
            field, something that is by default only possible for native
            Contentful assets.
          </Paragraph>
        </Typography>
      </WorkbenchContent>
    </Workbench>
  );
};

export default Config;
