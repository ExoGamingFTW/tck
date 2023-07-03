import {
  Avatar,
  Table,
  Group,
  Text,
  ScrollArea,
  Title,
  ActionIcon,
  Menu,
  Anchor
} from '@mantine/core';
import { getAllUsers, User, UserAccounts, UserAction } from 'database';
import dateformat from 'dateformat';

import Layout from '@/components/Layout';
import {
  IconDots,
  IconGavel,
  IconLock,
  IconLockOpen,
  IconPencil,
  IconTrash,
  IconUser
} from '@tabler/icons-react';

export async function getServerSideProps() {
  return {
    props: {
      users: await getAllUsers()
    }
  };
}

type IUser = User & {
  accounts: UserAccounts | null;
  actions: UserAction[];
};

function Users({ users }: { users: IUser[] }) {
  const rows = users.map((user) => {
    return (
      <tr key={user.id}>
        <td>
          <Group spacing='sm'>
            <Avatar size={40} radius='xl'>
              {(user.displayName || user.username)
                .split(' ')
                .splice(0, 2)
                .map((name: string) => {
                  return name.split('')[0];
                })
                .join('')}
            </Avatar>
            <div>
              <Text fz='sm' fw={500}>
                {user.username}
              </Text>
              <Text fz='xs' c='dimmed'>
                {`"${user.displayName}"`}
              </Text>
            </div>
          </Group>
        </td>
        <td>{user.email}</td>
        <td>{user.points}</td>
        <td>
          {dateformat(
            user.actions.find((action) => {
              return action.action === 'ACCOUNT_CREATE';
            })?.timestamp,
            'mmmm d, yyyy, h:MM:ss TT'
          )}
        </td>
        <td>
          {dateformat(
            user.actions
              .filter((action) => {
                return action.action === 'ACCOUNT_LOGIN';
              })
              .sort((a, b) => {
                return b.timestamp - a.timestamp;
              })[0]?.timestamp,
            'mmmm d, yyyy, h:MM:ss TT'
          )}
        </td>
        <td>
          <Anchor component='button'>View activity</Anchor>
        </td>
        <td>
          <Group spacing={0} position='left'>
            <ActionIcon>
              <IconPencil size='1rem' stroke={1.5} />
            </ActionIcon>
            <Menu
              transitionProps={{ transition: 'pop' }}
              withArrow
              position='bottom-end'
              withinPortal
            >
              <Menu.Target>
                <ActionIcon>
                  <IconDots size='1rem' stroke={1.5} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                {user.isAdmin ? (
                  <Menu.Item icon={<IconUser size='1rem' stroke={1.5} />}>Remove Admin</Menu.Item>
                ) : (
                  <Menu.Item icon={<IconGavel size='1rem' stroke={1.5} />}>Make Admin</Menu.Item>
                )}
                {user.isBanned ? (
                  <Menu.Item icon={<IconLockOpen size='1rem' stroke={1.5} />}>Unban</Menu.Item>
                ) : (
                  <Menu.Item icon={<IconLock size='1rem' stroke={1.5} />}>Ban</Menu.Item>
                )}
                <Menu.Item icon={<IconTrash size='1rem' stroke={1.5} />}>Delete</Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </td>
      </tr>
    );
  });

  return (
    <Layout>
      <Title mb='lg'>Users</Title>
      <ScrollArea>
        <Table highlightOnHover withBorder>
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Points</th>
              <th>Joined</th>
              <th>Last Active</th>
              <th>Activity</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </Table>
      </ScrollArea>
    </Layout>
  );
}

export default Users;