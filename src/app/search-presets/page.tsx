import SearchPresets from "@/components/search-presets";
import Wrapper from "@/layouts/Wrapper";

export const runtime = 'nodejs';

export const metadata = {
  title: "Preset Pencarian - Maskom",
  description: "Kelola filter pencarian tersimpan untuk akses cepat.",
};

const page = () => {
  return (
    <Wrapper>
      <SearchPresets />
    </Wrapper>
  )
}

export default page
