import { SignUp } from "@clerk/nextjs";
import React from "react";

const Page = () => {
  return (
    <div className="flex justify-center items-center p-3">
      <SignUp />
    </div>
  );
};

export default Page;
