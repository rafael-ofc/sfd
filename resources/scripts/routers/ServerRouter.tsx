import TransferListener from '@/components/server/TransferListener';
import React, { useEffect, useState } from 'react';
import { NavLink, Link, Route, RouteComponentProps, Switch } from 'react-router-dom';
import NavigationBar from '@/components/NavigationBar';
import ServerConsole from '@/components/server/ServerConsole';
import TransitionRouter from '@/TransitionRouter';
import WebsocketHandler from '@/components/server/WebsocketHandler';
import { ServerContext } from '@/state/server';
import DatabasesContainer from '@/components/server/databases/DatabasesContainer';
import FileManagerContainer from '@/components/server/files/FileManagerContainer';
import { CSSTransition } from 'react-transition-group';
import SuspenseSpinner from '@/components/elements/SuspenseSpinner';
import FileEditContainer from '@/components/server/files/FileEditContainer';
import SettingsContainer from '@/components/server/settings/SettingsContainer';
import ScheduleContainer from '@/components/server/schedules/ScheduleContainer';
import ScheduleEditContainer from '@/components/server/schedules/ScheduleEditContainer';
import UsersContainer from '@/components/server/users/UsersContainer';
import Can from '@/components/elements/Can';
import BackupContainer from '@/components/server/backups/BackupContainer';
import Spinner from '@/components/elements/Spinner';
import ScreenBlock, { NotFound, ServerError } from '@/components/elements/ScreenBlock';
import { httpErrorToHuman } from '@/api/http';
import { useStoreState } from 'easy-peasy';
import SubNavigation from '@/components/elements/SubNavigation';
import NetworkContainer from '@/components/server/network/NetworkContainer';
import InstallListener from '@/components/server/InstallListener';
import StartupContainer from '@/components/server/startup/StartupContainer';
import ErrorBoundary from '@/components/elements/ErrorBoundary';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExternalLinkAlt, faHome, faServer, faKey, faSignOutAlt, faTerminal, faFolder, faDatabase, faCalendarWeek, faUser, faCloudDownloadAlt, faEthernet, faPlay, faCogs } from '@fortawesome/free-solid-svg-icons';
import RequireServerPermission from '@/hoc/RequireServerPermission';
import ServerInstallSvg from '@/assets/images/server_installing.svg';
import ServerRestoreSvg from '@/assets/images/server_restore.svg';
import ServerErrorSvg from '@/assets/images/server_error.svg';
import { ApplicationStore } from '@/state';

const ConflictStateRenderer = () => {
    const status = ServerContext.useStoreState(state => state.server.data?.status || null);
    const isTransferring = ServerContext.useStoreState(state => state.server.data?.isTransferring || false);

    return (
        status === 'installing' || status === 'install_failed' ?
            <ScreenBlock
                title={'Running Installer'}
                image={ServerInstallSvg}
                message={'Your server should be ready soon, please try again in a few minutes.'}
            />
            :
            status === 'suspended' ?
                <ScreenBlock
                    title={'Server Suspended'}
                    image={ServerErrorSvg}
                    message={'This server is suspended and cannot be accessed.'}
                />
                :
                <ScreenBlock
                    title={isTransferring ? 'Transferring' : 'Restoring from Backup'}
                    image={ServerRestoreSvg}
                    message={isTransferring ? 'Your server is being transfered to a new node, please check back later.' : 'Your server is currently being restored from a backup, please check back in a few minutes.'}
                />
    );
};

const ServerRouter = ({ match, location }: RouteComponentProps<{ id: string }>) => {
    const rootAdmin = useStoreState(state => state.user.data!.rootAdmin);
    const [ error, setError ] = useState('');

    const id = ServerContext.useStoreState(state => state.server.data?.id);
    const uuid = ServerContext.useStoreState(state => state.server.data?.uuid);
    const inConflictState = ServerContext.useStoreState(state => state.server.inConflictState);
    const serverId = ServerContext.useStoreState(state => state.server.data?.internalId);
    const getServer = ServerContext.useStoreActions(actions => actions.server.getServer);
    const clearServerState = ServerContext.useStoreActions(actions => actions.clearServerState);
    const name = useStoreState((state: ApplicationStore) => state.settings.data!.name);

    useEffect(() => () => {
        clearServerState();
    }, []);

    useEffect(() => {
        setError('');

        getServer(match.params.id)
            .catch(error => {
                console.error(error);
                setError(httpErrorToHuman(error));
            });

        return () => {
            clearServerState();
        };
    }, [ match.params.id ]);

    return (
        <React.Fragment key={'server-router'}>
            <NavigationBar/>
            {(!uuid || !id) ?
                error ?
                    <ServerError message={error}/>
                    :
                    <Spinner size={'large'} centered/>
                :
                <>
                    <CSSTransition timeout={150} classNames={'fade'} appear in>
                        <SubNavigation>
                            <div>
                            <div id={'logo'} style={{textAlign: 'center'}}>
                    <Link to={'/'}>
                        <h1>
                        {name}
                        </h1>
                    </Link>
                </div>
                            <NavLink to={`/`} exact><FontAwesomeIcon fixedWidth className="listicon" icon={faHome} /><span css="padding-left: 5%;" className="listText"> Return Home</span></NavLink>
                              <NavLink to={`${match.url}`} exact><FontAwesomeIcon fixedWidth className="listicon" icon={faTerminal} /><span css="padding-left: 5%;" className="listText"> Console</span></NavLink>
                                <Can action={'file.*'}>
                                    <NavLink to={`${match.url}/files`}><FontAwesomeIcon fixedWidth className="listicon" icon={faFolder} /><span css="padding-left: 5%;" className="listText"> File Manager</span></NavLink>
                                </Can>
                                <Can action={'database.*'}>
                                    <NavLink to={`${match.url}/databases`}><FontAwesomeIcon fixedWidth className="listicon" icon={faDatabase} /><span css="padding-left: 5%;" className="listText"> Databases</span></NavLink>
                                </Can>
                                <Can action={'schedule.*'}>
                                    <NavLink to={`${match.url}/schedules`}><FontAwesomeIcon fixedWidth className="listicon" icon={faCalendarWeek} /><span css="padding-left: 5%;" className="listText"> Schedules</span></NavLink>
                                </Can>
                                <Can action={'user.*'}>
                                    <NavLink to={`${match.url}/users`}><FontAwesomeIcon fixedWidth className="listicon" icon={faUser} /><span css="padding-left: 5%;" className="listText"> Users</span></NavLink>
                                </Can>
                                <Can action={'backup.*'}>
                                    <NavLink to={`${match.url}/backups`}><FontAwesomeIcon fixedWidth className="listicon" icon={faCloudDownloadAlt} /><span css="padding-left: 5%;" className="listText"> Backups</span></NavLink>
                                </Can>
                                <Can action={'allocation.*'}>
                                    <NavLink to={`${match.url}/network`}><FontAwesomeIcon fixedWidth className="listicon" icon={faEthernet} /><span css="padding-left: 5%;" className="listText"> Network</span></NavLink>
                                </Can>
                                <Can action={'startup.*'}>
                                    <NavLink to={`${match.url}/startup`}><FontAwesomeIcon fixedWidth className="listicon" icon={faPlay} /><span css="padding-left: 5%;" className="listText"> Startup</span></NavLink>
                                </Can>
                                <Can action={[ 'settings.*', 'file.sftp' ]} matchAny>
                                    <NavLink to={`${match.url}/settings`}><FontAwesomeIcon fixedWidth className="listicon" icon={faCogs} /><span css="padding-left: 5%;" className="listText"> Settings</span></NavLink>
                                </Can>
                                {rootAdmin &&
                                <a href={'/admin/servers/view/' + serverId} rel="noreferrer" target={'_blank'}>
                                    <FontAwesomeIcon fixedWidth icon={faExternalLinkAlt}/><span css="padding-left: 5%;" className="listText"> Admin Settings</span>
                                </a>
                                }
                            </div>
                        </SubNavigation>
                    </CSSTransition>
                    <InstallListener/>
                    <TransferListener/>
                    <WebsocketHandler/>
                    {(inConflictState && (!rootAdmin || (rootAdmin && !location.pathname.endsWith(`/server/${id}`)))) ?
                        <ConflictStateRenderer/>
                        :
                        <ErrorBoundary>
                            <TransitionRouter>
                                <Switch location={location}>
                                    <Route path={`${match.path}`} component={ServerConsole} exact/>
                                    <Route path={`${match.path}/files`} exact>
                                        <RequireServerPermission permissions={'file.*'}>
                                            <FileManagerContainer/>
                                        </RequireServerPermission>
                                    </Route>
                                    <Route path={`${match.path}/files/:action(edit|new)`} exact>
                                        <SuspenseSpinner>
                                            <FileEditContainer/>
                                        </SuspenseSpinner>
                                    </Route>
                                    <Route path={`${match.path}/databases`} exact>
                                        <RequireServerPermission permissions={'database.*'}>
                                            <DatabasesContainer/>
                                        </RequireServerPermission>
                                    </Route>
                                    <Route path={`${match.path}/schedules`} exact>
                                        <RequireServerPermission permissions={'schedule.*'}>
                                            <ScheduleContainer/>
                                        </RequireServerPermission>
                                    </Route>
                                    <Route path={`${match.path}/schedules/:id`} exact>
                                        <ScheduleEditContainer/>
                                    </Route>
                                    <Route path={`${match.path}/users`} exact>
                                        <RequireServerPermission permissions={'user.*'}>
                                            <UsersContainer/>
                                        </RequireServerPermission>
                                    </Route>
                                    <Route path={`${match.path}/backups`} exact>
                                        <RequireServerPermission permissions={'backup.*'}>
                                            <BackupContainer/>
                                        </RequireServerPermission>
                                    </Route>
                                    <Route path={`${match.path}/network`} exact>
                                        <RequireServerPermission permissions={'allocation.*'}>
                                            <NetworkContainer/>
                                        </RequireServerPermission>
                                    </Route>
                                    <Route path={`${match.path}/startup`} component={StartupContainer} exact/>
                                    <Route path={`${match.path}/settings`} component={SettingsContainer} exact/>
                                    <Route path={'*'} component={NotFound}/>
                                </Switch>
                            </TransitionRouter>
                        </ErrorBoundary>
                    }
                </>
            }
        </React.Fragment>
    );
};

export default (props: RouteComponentProps<any>) => (
    <ServerContext.Provider>
        <ServerRouter {...props}/>
    </ServerContext.Provider>
);
