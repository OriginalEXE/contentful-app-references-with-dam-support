import * as React from 'react';
import { css } from 'emotion';
import tokens from '@contentful/forma-36-tokens';
import { SpaceAPI } from '@contentful/app-sdk';
import {
  DropdownList,
  DropdownListItem,
  EntryCard,
  Icon,
} from '@contentful/forma-36-react-components';
import { ContentType, Entry } from '../../types';
import { isValidImage } from '../../utils/isValidImage';
import { entityHelpers } from '@contentful/field-editor-shared';
import * as z from 'zod';
import {
  AssetThumbnail,
  MissingEntityCard,
  ScheduledIconWithTooltip,
} from '../../components';

const { getEntryTitle, getEntityDescription, getEntryStatus, getEntryImage } =
  entityHelpers;

const styles = {
  scheduleIcon: css({
    marginRight: tokens.spacing2Xs,
  }),
};

export interface WrappedEntryCardProps {
  getEntityScheduledActions: SpaceAPI['getEntityScheduledActions'];
  getAsset: (assetId: string) => Promise<unknown>;
  entryUrl?: string;
  size: 'small' | 'default' | 'auto';
  isDisabled: boolean;
  isSelected?: boolean;
  onRemove?: () => void;
  onEdit?: () => void;
  localeCode: string;
  defaultLocaleCode: string;
  contentType?: ContentType;
  entry: Entry;
  cardDragHandle?: React.ReactElement;
  isClickable?: boolean;
  hasCardEditActions: boolean;
  onMoveTop?: () => void;
  onMoveBottom?: () => void;
  hasMoveOptions?: boolean;
}

const defaultProps = {
  isClickable: true,
  hasCardEditActions: true,
  hasMoveOptions: true,
};

const bynderAssetsSchema = z.array(
  z.object({
    type: z.string(),
    src: z.string(),
    brandId: z.string(),
    name: z.string(),
    extension: z.array(z.string()),
  }),
);

interface ThumbnailImage {
  url: string;
  fileName: string;
  contentType?: string;
}

interface GetEntryDAMImageInput {
  entry: Entry;
  contentType?: ContentType;
  localeCode: string;
}

const getEntryDAMImage = async ({
  entry,
  contentType,
  localeCode,
}: GetEntryDAMImageInput): Promise<null | ThumbnailImage> => {
  if (contentType === undefined) {
    return null;
  }

  const objectFields = contentType.fields.filter(
    (field) => field.type === 'Object',
  );

  if (objectFields.length === 0) {
    return null;
  }

  let damImage: ThumbnailImage | null = null;

  objectFields.some((field) => {
    const isBynderAssets = bynderAssetsSchema.safeParse(
      entry.fields[field.id]?.[localeCode],
    );

    if (isBynderAssets.success === true) {
      const imageAsset = isBynderAssets.data.find(
        (asset) => asset.type === 'image',
      );

      if (imageAsset === undefined) {
        return false;
      }

      damImage = {
        url: `${imageAsset.src}?io=transform:fill,width:70,height:70`,
        fileName: imageAsset.name,
        contentType: `image/${imageAsset.extension[0]}`,
      };
      return true;
    }

    return false;
  });

  return damImage;
};

export function WrappedEntryCard(props: WrappedEntryCardProps) {
  const [file, setFile] = React.useState<null | ThumbnailImage>(null);

  const { contentType } = props;

  React.useEffect(() => {
    if (props.entry) {
      getEntryImage(
        {
          entry: props.entry,
          contentType,
          localeCode: props.localeCode,
          defaultLocaleCode: props.defaultLocaleCode,
        },
        props.getAsset,
      )
        .then((file) => {
          if (file === null) {
            return getEntryDAMImage({
              entry: props.entry,
              contentType,
              localeCode: props.localeCode,
            }).then((damFile) => {
              setFile(damFile);
            });
          }

          setFile({
            ...file,
            url: `${file.url}?w=70&h=70&fit=thumb`,
          });
        })
        .catch(() => {
          setFile(null);
        });
    }
  }, [
    props.entry,
    props.getAsset,
    contentType,
    props.localeCode,
    props.defaultLocaleCode,
  ]);

  const status = getEntryStatus(props.entry?.sys);

  if (status === 'deleted') {
    return (
      <MissingEntityCard
        entityType="Entry"
        isDisabled={props.isDisabled}
        onRemove={props.onRemove}
      />
    );
  }

  const title = getEntryTitle({
    entry: props.entry,
    contentType,
    localeCode: props.localeCode,
    defaultLocaleCode: props.defaultLocaleCode,
    defaultTitle: 'Untitled',
  });

  const description = getEntityDescription({
    entity: props.entry,
    contentType,
    localeCode: props.localeCode,
    defaultLocaleCode: props.defaultLocaleCode,
  });

  return (
    // TODO: There should be dedicated components for each `size` with a different
    //  set of params (e.g. `file` should only be relevant for the "small" size card.
    <EntryCard
      href={props.entryUrl}
      title={title}
      description={description}
      contentType={contentType?.name}
      size={props.size}
      selected={props.isSelected}
      status={status}
      statusIcon={
        <ScheduledIconWithTooltip
          getEntityScheduledActions={props.getEntityScheduledActions}
          entityType="Entry"
          entityId={props.entry.sys.id}
        >
          <Icon
            className={styles.scheduleIcon}
            icon="Clock"
            size="small"
            color="muted"
            testId="schedule-icon"
          />
        </ScheduledIconWithTooltip>
      }
      thumbnailElement={
        file && isValidImage(file.contentType ?? '') ? (
          <AssetThumbnail
            url={file.url}
            alt={file.fileName}
            width={70}
            height={70}
          />
        ) : null
      }
      cardDragHandleComponent={props.cardDragHandle}
      withDragHandle={!!props.cardDragHandle}
      dropdownListElements={
        props.onEdit || props.onRemove ? (
          <React.Fragment>
            <DropdownList
              // @ts-expect-error
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              {props.hasCardEditActions && props.onEdit && (
                <DropdownListItem
                  onClick={() => {
                    props.onEdit && props.onEdit();
                  }}
                  testId="edit"
                >
                  Edit
                </DropdownListItem>
              )}
              {props.onRemove && (
                <DropdownListItem
                  onClick={() => {
                    props.onRemove && props.onRemove();
                  }}
                  isDisabled={props.isDisabled}
                  testId="delete"
                >
                  Remove
                </DropdownListItem>
              )}
            </DropdownList>
            {props.hasMoveOptions ? (
              <DropdownList
                border="top"
                // @ts-expect-error
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <DropdownListItem
                  onClick={() => props.onMoveTop && props.onMoveTop()}
                  isDisabled={!props.onMoveTop}
                  testId="move-top"
                >
                  Move to top
                </DropdownListItem>
                <DropdownListItem
                  onClick={() => props.onMoveBottom && props.onMoveBottom()}
                  isDisabled={!props.onMoveBottom}
                  testId="move-bottom"
                >
                  Move to bottom
                </DropdownListItem>
              </DropdownList>
            ) : (
              <React.Fragment />
            )}
          </React.Fragment>
        ) : undefined
      }
      onClick={(e) => {
        e.preventDefault();
        if (!props.isClickable) return;
        props.onEdit && props.onEdit();
      }}
    />
  );
}

WrappedEntryCard.defaultProps = defaultProps;
