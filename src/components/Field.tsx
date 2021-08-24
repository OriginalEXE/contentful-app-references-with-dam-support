import { FieldExtensionSDK } from '@contentful/app-sdk';
import {
  Field as DefaultField,
  FieldWrapper,
} from '@contentful/default-field-editors';
import { useEffect } from 'react';
import {
  SingleEntryReferenceEditor,
  MultipleEntryReferenceEditor,
} from '../reference/src';

interface FieldProps {
  sdk: FieldExtensionSDK;
}

const Field: React.FC<FieldProps> = (props) => {
  const { sdk } = props;

  // if (sdk.field.type === 'Link') {
  //   return <SingleEntryReferenceEditor
  // }

  useEffect(() => {
    sdk.window.startAutoResizer();

    return () => {
      sdk.window.stopAutoResizer();
    };
  }, [sdk.window]);

  return (
    <FieldWrapper
      sdk={sdk}
      name={sdk.field.id}
      showFocusBar={false}
      renderHeading={() => null}
    >
      <DefaultField
        sdk={sdk}
        getOptions={() => {
          return {
            entryLinkEditor: {
              viewType: 'card',
            },
          };
        }}
        renderFieldEditor={(widgetId, sdk, isInitiallyDisabled) => {
          return sdk.field.type === 'Link' ? (
            <SingleEntryReferenceEditor
              sdk={sdk}
              isInitiallyDisabled={isInitiallyDisabled}
              viewType="card"
              hasCardEditActions={true}
              parameters={{
                instance: {
                  showCreateEntityAction: true,
                  showLinkEntityAction: true,
                },
              }}
            />
          ) : (
            <MultipleEntryReferenceEditor
              sdk={sdk}
              isInitiallyDisabled={isInitiallyDisabled}
              viewType="card"
              hasCardEditActions={true}
              parameters={{
                instance: {
                  showCreateEntityAction: true,
                  showLinkEntityAction: true,
                },
              }}
            />
          );
        }}
      />
    </FieldWrapper>
  );
};

export default Field;
