import { CrStep, CrStepper } from '@cristal/react';

export default function StepperBasic() {
  return (
    <CrStepper label="Sign-up" navigation style={{ width: '100%' }}>
      <CrStep label="Account">Choose an email address and a password.</CrStep>
      <CrStep label="Profile">Add your name and a photo.</CrStep>
      <CrStep label="Plan">Choose your plan.</CrStep>
      <CrStep label="Finish">Check your details, then confirm.</CrStep>
    </CrStepper>
  );
}
