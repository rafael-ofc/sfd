import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArchive, faEllipsisH } from '@fortawesome/free-solid-svg-icons';
import { format, formatDistanceToNow } from 'date-fns';
import Spinner from '@/components/elements/Spinner';
import { bytesToHuman } from '@/helpers';
import Can from '@/components/elements/Can';
import useWebsocketEvent from '@/plugins/useWebsocketEvent';
import BackupContextMenu from '@/components/server/backups/BackupContextMenu';
import tw from 'twin.macro';
import GreyRowBox from '@/components/elements/GreyRowBox';
import getServerBackups from '@/api/swr/getServerBackups';
import { ServerBackup } from '@/api/server/types';
import { SocketEvent } from '@/components/server/events';

interface Props {
    backup: ServerBackup;
    className?: string;
}

export default ({ backup, className }: Props) => {
    const { mutate } = getServerBackups();

    useWebsocketEvent(`${SocketEvent.BACKUP_COMPLETED}:${backup.uuid}` as SocketEvent, data => {
        try {
            const parsed = JSON.parse(data);

            mutate(data => ({
                ...data,
                items: data.items.map(b => b.uuid !== backup.uuid ? b : ({
                    ...b,
                    isSuccessful: parsed.is_successful || true,
                    checksum: (parsed.checksum_type || '') + ':' + (parsed.checksum || ''),
                    bytes: parsed.file_size || 0,
                    completedAt: new Date(),
                })),
            }), false);
        } catch (e) {
            console.warn(e);
        }
    });

    return (
        <GreyRowBox css={tw`flex-wrap md:flex-nowrap items-center`} className={className}>
            <div css={tw`flex items-center truncate w-full md:flex-1`}>
                <div css={tw`mr-4`}>
                    {backup.completedAt ?
                        <FontAwesomeIcon icon={faArchive} css={tw`text-neutral-920`}/>
                        :
                        <Spinner size={'small'}/>
                    }
                </div>
                <div css={tw`flex flex-col truncate`}>
                    <div css={tw`flex items-center text-sm mb-1`}>
                        {!backup.isSuccessful &&
                        <span css={tw`bg-red-500 py-px px-2 rounded-full text-white text-xs uppercase border border-red-600 mr-2`}>
                            Failed
                        </span>
                        }
                        <p css={tw`text-white break-words truncate`}>
                            {backup.name}
                        </p>
                        {(backup.completedAt && backup.isSuccessful) &&
                        <span css={tw`ml-3 text-white text-xs hidden sm:inline`}>{bytesToHuman(backup.bytes)}</span>
                        }
                    </div>
                    <p css={tw`mt-1 md:mt-0 text-xs text-white font-mono truncate`}>
                        {backup.uuid}
                    </p>
                </div>
            </div>
            <div css={tw`flex-1 md:flex-none md:w-48 mt-4 md:mt-0 md:ml-8 md:text-center`}>
                <p
                    title={format(backup.createdAt, 'ddd, MMMM do, yyyy HH:mm:ss')}
                    css={tw`text-white text-sm`}
                >
                    {formatDistanceToNow(backup.createdAt, { includeSeconds: true, addSuffix: true })}
                </p>
                <p css={tw`text-2xs text-white uppercase mt-1`}>Created</p>
            </div>
            <Can action={'backup.download'}>
                <div css={tw`mt-4 md:mt-0 ml-6`} style={{ marginRight: '-0.5rem' }}>
                    {!backup.completedAt ?
                        <div css={tw`p-2 invisible`}>
                            <FontAwesomeIcon icon={faEllipsisH}/>
                        </div>
                        :
                        <BackupContextMenu backup={backup}/>
                    }
                </div>
            </Can>
        </GreyRowBox>
    );
};
