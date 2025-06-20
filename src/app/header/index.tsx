"use client"
import React from 'react'
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Button } from "@progress/kendo-react-buttons";
import { 
  AppBar,
  AppBarSection,
  AppBarSpacer
} from "@progress/kendo-react-layout";
import { userIcon } from '@progress/kendo-svg-icons';

export default function Header() {
  const router = useRouter();
    return (
    <AppBar themeColor='primary'>
        <AppBarSection><Link href={"/"}><h1>Appointment Manager</h1></Link></AppBarSection>
        <AppBarSpacer />
        <AppBarSection>
            <Button svgIcon={userIcon} fillMode={'flat'} type="button" onClick={() => router.push('/profile')} />
        </AppBarSection>
      </AppBar>)
}