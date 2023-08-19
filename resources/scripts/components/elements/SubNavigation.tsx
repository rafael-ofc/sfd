import styled from 'styled-components/macro';
import tw, { theme } from 'twin.macro';

const SubNavigation = styled.div`
    ${tw`w-full shadow overflow-x-auto`};

    & > div {
      left: 0 !important;
      top: 0 !important;
    	position: fixed !important;
    	background: #3f4d5a !important;
      line-height: 1 !important;
    	width: 170px !important;
    	height: 100% !important;
    	display: block !important;
    	padding-left: 0 !important;
    	z-index: 1000000 !important;
    	overflow-y: auto !important;
    	box-shadow: 3px 0 rgba(0,0,0, .05);
      transition: 300ms ease all;

        @media only screen and (max-width: 640px) {
          width: 50px !important;
          transition: 300ms ease all;
        }

        & > a, & > div {
            ${tw`inline-block py-3 w-full px-4 text-white no-underline whitespace-nowrap transition-all duration-150`};

            &:hover {
                transition: 500ms ease all;
                box-shadow: inset 2px 0 0 white;
            }

            &:active, &.active {
                box-shadow: inset 2px 0 0 white;
                transition: 500ms ease all;
            }
        }
    }
`;

export default SubNavigation;
