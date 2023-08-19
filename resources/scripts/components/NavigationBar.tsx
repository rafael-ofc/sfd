import * as React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCogs, faLayerGroup, faSignOutAlt, faUserCircle, faKey, faUser, faServer } from '@fortawesome/free-solid-svg-icons';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import SearchContainer from '@/components/dashboard/search/SearchContainer';
import tw, { theme } from 'twin.macro';
import styled from 'styled-components/macro';
import SubNavigation from '@/components/elements/SubNavigation';

export default () => {
    const name = useStoreState((state: ApplicationStore) => state.settings.data!.name);
    const rootAdmin = useStoreState((state: ApplicationStore) => state.user.data!.rootAdmin);

    return (
      <SubNavigation>
          <div>
          <div id={'logo'} style={{textAlign: 'center'}}>
                    <Link to={'/'}>
                        <h1>
                        {name}
                        </h1>
                    </Link>
                </div>
              <NavLink to={`/`} exact><FontAwesomeIcon fixedWidth className="listicon" icon={faServer} /><span css="padding-left: 5%;" className="listText"> Server List</span></NavLink>
              <NavLink to={`/account`} exact><FontAwesomeIcon fixedWidth className="listicon" icon={faUser} /><span css="padding-left: 5%;" className="listText"> Account</span></NavLink>
              <NavLink to={`/account/api`} exact><FontAwesomeIcon fixedWidth className="listicon" icon={faKey} /><span css="padding-left: 5%;" className="listText"> API Credentials</span></NavLink>
              {rootAdmin &&
                  <a href={'/admin'} rel={'noreferrer'}><FontAwesomeIcon fixedWidth className="listicon" icon={faCogs} /><span css="padding-left: 5%;" className="listText"> Admin Settings</span></a>
              }
              <a href={'/auth/logout'}><FontAwesomeIcon fixedWidth className="listicon" icon={faSignOutAlt} /><span css="padding-left: 5%;" className="listText"> Logout</span></a>
          </div>
      </SubNavigation>
    );
};
