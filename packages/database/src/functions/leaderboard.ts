import axios, { AxiosHeaders } from 'axios';
import { LeaderboardApiResponse, LeaderboardSpot, LeaderboardType } from 'types';

import { prisma } from '../client';

async function ensureLeaderboard(type: LeaderboardType) {
  // Create the leaderboard if it doesn't exist.
  const leaderboard = await prisma.leaderboard.findUnique({
    where: {
      type
    }
  });
  if (!leaderboard) {
    await prisma.leaderboard.create({
      data: {
        type,
        spots: {
          create: []
        }
      }
    });
  }
}

export async function updateLeaderboard(type: LeaderboardType, data: LeaderboardSpot[]) {
  await ensureLeaderboard(type);

  // Delete old leaderboard.
  // TODO: Save old one.
  await prisma.leaderboardSpot.deleteMany({
    where: {
      leaderboard: {
        type
      }
    }
  });

  // Update.
  await prisma.leaderboard.update({
    where: {
      type
    },
    data: {
      spots: {
        create: data
      }
    }
  });
}

export async function getLeaderboard(type: LeaderboardType) {
  await ensureLeaderboard(type);

  let spots: LeaderboardSpot[] = [];

  if (type === 'gamdom') {
    const response = await axios.get(
      `https://gamdom.com/api/affiliates/leaderboard?apikey=${process.env.GAMDOM_API_KEY}&after=${
        new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
      }`,
      {
        validateStatus: () => {
          return true;
        }
      }
    );

    if (response.status === 200) {
      const data: LeaderboardApiResponse = response.data;
      spots = data.data
        .sort((a, b) => {
          return b.wager_data[0].total_wager_usd - a.wager_data[0].total_wager_usd;
        })
        .splice(0, 10)
        .map((spot) => {
          return {
            username: spot.username,
            amount: Math.round(spot.wager_data[0].total_wager_usd)
          };
        });
    }
  }

  if (type === 'clash') {
    const response = await axios.get(
      'https://api.clash.gg/affiliates/detailed-summary/v2/2023-01-01',
      {
        headers: {
          Authorization: `Bearer ${process.env.CLASH_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log(response.data);
  }

  if (type !== 'stake' && spots.length > 0) {
    await updateLeaderboard(type, spots);
  }

  return await prisma.leaderboard.findUnique({
    where: {
      type
    },
    include: {
      spots: {
        orderBy: {
          amount: 'desc'
        }
      }
    }
  });
}

export async function getAllLeaderboards() {
  return {
    stake: await getLeaderboard('stake'),
    gamdom: await getLeaderboard('gamdom'),
    csgoroll: await getLeaderboard('csgoroll'),
    hypedrop: await getLeaderboard('hypedrop'),
    clash: await getLeaderboard('clash')
  };
}
