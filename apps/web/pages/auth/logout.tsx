import { CheckIcon } from "@heroicons/react/outline";
import { GetServerSidePropsContext } from "next";
import { useSession, signOut } from "next-auth/react";
import { getCookieParser } from "next/dist/server/api-utils";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";

import Button from "@calcom/ui/Button";

import { useLocale } from "@lib/hooks/useLocale";
import { inferSSRProps } from "@lib/types/inferSSRProps";

import AuthContainer from "@components/ui/AuthContainer";

import { ssrInit } from "@server/lib/ssr";

type Props = inferSSRProps<typeof getServerSideProps>;

export default function Logout(props: Props) {
  const { data: session, status } = useSession();
  if (status === "authenticated") signOut({ redirect: false });
  const router = useRouter();
  useEffect(() => {
    if (props.query?.survey === "true") {
      router.push("https://cal.com/cancellation");
    }
  }, [props.query?.survey, router]);
  const { t } = useLocale();

  return (
    <AuthContainer title={t("logged_out")} description={t("youve_been_logged_out")}>
      <div className="mb-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <CheckIcon className="h-6 w-6 text-green-600" />
        </div>
        <div className="mt-3 text-center sm:mt-5">
          <h3 className="text-lg font-medium leading-6 text-gray-900" id="modal-title">
            {t("youve_been_logged_out")}
          </h3>
          <div className="mt-2">
            <p className="text-sm text-gray-500">{t("hope_to_see_you_soon")}</p>
          </div>
        </div>
      </div>
      <Link href="/auth/login" passHref>
        <Button className="flex w-full justify-center"> {t("go_back_login")}</Button>
      </Link>
    </AuthContainer>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const ssr = await ssrInit(context);
  // Deleting old cookie manually, remove this code after all existing cookies have expired
  context.res.setHeader(
    "Set-Cookie",
    "next-auth.session-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;"
  );

  return {
    props: {
      trpcState: ssr.dehydrate(),
      query: context.query,
    },
  };
}
