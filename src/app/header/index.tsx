'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@progress/kendo-react-buttons';
import {
  AppBar,
  AppBarSection,
  AppBarSpacer
} from '@progress/kendo-react-layout';
import { calendarIcon, userIcon } from '@progress/kendo-svg-icons';

interface HeaderProps {
  userID: string;
}

export default function Header(props: HeaderProps): JSX.Element {
  const router = useRouter();

  const userId: string = props.userID; // Replace with dynamic value if you add login later

  const handleProfileClick = (): void => {
    router.push(`/profile?userId=${encodeURIComponent(userId)}`);
  };

  const handleCalendarClick = (): void => {
    router.push(`/`);
  };

  return (
    <AppBar themeColor="primary">
      <AppBarSection>
        <Link href="/">
          <h1>Appointment Manager</h1>
        </Link>
      </AppBarSection>
      <AppBarSpacer />
      <AppBarSection>
        <Button
          svgIcon={calendarIcon}
          fillMode="flat"
          type="button"
          onClick={handleCalendarClick}
        />

        <Button
          svgIcon={userIcon}
          fillMode="flat"
          type="button"
          onClick={handleProfileClick}
        />
        
      </AppBarSection>
    </AppBar>
  );
}
