import { faChevronRight } from '@fortawesome/free-solid-svg-icons';

import Button from '@/components/ui/Button/Button';
import ProfileBoxBase from '@/components/profile/ProfileBoxBase/ProfileBoxBase';
import VerificationKick from '@/components/profile/verification/VerificationKick/VerificationKick';

import { useProfile } from '@/hooks/profile';

import classes from './ProfileTabConnections.module.scss';
import ProfileAffiliateConnection from '../../ProfileAffiliateConnection';

function ProfileTabConnections() {
  const profile = useProfile();

  function close() {
    profile.close();
  }

  return (
    <>
      <div className={classes.group}>
        <VerificationKick />
      </div>
      <hr className={classes.hr} />
      <div className={classes.group}>
        <ProfileAffiliateConnection
          name='Roobet'
          httpAddress='/api/v1/user/accounts/update-roobet'
        />
        <ProfileAffiliateConnection
          name='CSGOBig'
          httpAddress='/api/v1/user/accounts/update-csgobig'
        />
      </div>
      <Button rightIcon={faChevronRight} onClick={close} variant='gradient'>
        Save Changes
      </Button>
    </>
  );
}

export default ProfileTabConnections;
