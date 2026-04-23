"use client";

import Pagination from "@mui/material/Pagination";
 
import { useRouter, useSearchParams, usePathname } from "next/navigation";

export function PaginationControl({ page, totalPages }: { page: number; totalPages: number;}) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

   function onChangeHandler(event: React.ChangeEvent<unknown>, value: number) {    
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", value.toString());
    router.push(`${pathname}?${params.toString()}`);
   }
  
  return (
    <div className="flex justify-center my-4">
      <Pagination
        page={page}
        count={totalPages}
        variant="outlined"
        shape="rounded"
        onChange={onChangeHandler}
        sx={{'& .MuiPaginationItem-root.Mui-selected': {
          backgroundColor: "#ededed",
          color: "#0a0a0a",
          borderColor: "#ededed",
        }}}        
        />
    </div>
  );
}
