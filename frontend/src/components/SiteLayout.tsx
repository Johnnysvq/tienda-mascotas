import { Outlet } from 'react-router'
import { SiteNavbar } from './SiteNavbar'

export function SiteLayout() {
    return (
        <>
            <SiteNavbar />
            <Outlet />
        </>
    )
}