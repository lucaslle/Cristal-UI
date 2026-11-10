import { CrBox, CrBreadcrumb } from '@cristal/react';

export default function BreadcrumbBasic() {
  return (
    <CrBox display="flex" direction="column" gap="lg">
      <CrBreadcrumb>
        <a href="/docs">Home</a>
        <a href="/docs/composants/bouton">Components</a>
        <span>Breadcrumb</span>
      </CrBreadcrumb>
      <CrBreadcrumb>
        <a href="/docs">Home</a>
        <a href="/docs">Shop</a>
        <a href="/docs">Home and garden</a>
        <a href="/docs">Kitchen</a>
        <a href="/docs">Utensils</a>
        <span>Steel whisk</span>
      </CrBreadcrumb>
    </CrBox>
  );
}
