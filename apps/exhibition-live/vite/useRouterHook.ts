import { ModRouter } from "@slub/edb-global-types";
import {
  Location,
  Params,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { useCallback } from "react";

/**
 * Function converts path like /user/123 to /user/:id
 */
const getRoutePath = (location: Location<any>, params: Params): string => {
  const { pathname } = location;

  if (!Object.keys(params).length) {
    return pathname; // we don't need to replace anything
  }

  let path = pathname;
  Object.entries(params).forEach(([paramName, paramValue]) => {
    if (paramValue) {
      path = path.replace(paramValue, `:${paramName}`);
    }
  });
  return path;
};

export const useRouterHook: () => ModRouter = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const push: ModRouter["push"] = useCallback(
    async (path, as) => navigate(path),
    [navigate],
  );
  const replace: ModRouter["replace"] = useCallback(
    async (path, as) => navigate(path, { replace: true }),
    [navigate],
  );
  const params = useParams();
  const location = useLocation();
  const asPath = getRoutePath(location, params);

  return {
    push,
    replace,
    asPath,
    pathname: location.pathname,
    query: params,
    searchParams,
    setSearchParams,
  };
};
