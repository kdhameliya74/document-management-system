import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const activityApi = createApi({
    reducerPath: "activityApi",
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_API_URL,
        credentials: "include",
    }),
    tagTypes: ["Activity"],
    endpoints: (builder) => ({
        getActivityLogs: builder.query({
            query: ({ docId, page = 1, limit = 10 }) => ({
                url: `/activity-logs`,
                params: { id: docId, page, limit },
            }),

            serializeQueryArgs: ({ queryArgs }) => {
                return { docId: queryArgs.docId };
            },
            merge: (currentCache, newItems, { arg }) => {
                currentCache.activities ??= [];
                currentCache.fetchedPages ??= [];

                // Prevent re-processing same page
                if (currentCache.fetchedPages.includes(arg.page)) return;

                currentCache.fetchedPages.push(arg.page);

                const existingIds = new Set(currentCache.activities.map(({ id }) => id));

                const uniqueActivities = newItems.activities.filter(
                    ({ id }) => !existingIds.has(id)
                );

                currentCache.activities.push(...uniqueActivities);

                currentCache.total = newItems.total;
                currentCache.hasMore = newItems.hasMore;
            },

            forceRefetch({ currentArg, state }) {
                const queryStatus = activityApi.endpoints.getActivityLogs.select(currentArg)(state);
                const cacheData = queryStatus?.data;
                if (currentArg.page === 1 && cacheData?.activities?.length > 0) {
                    return false;
                }
                if (currentArg.page > 1 && !cacheData?.fetchedPages?.includes(currentArg.page)) {
                    return true;
                }

                //refetch if we have no data at all
                return !cacheData;
            },
        }),
    }),
});

export const { useGetActivityLogsQuery } = activityApi;
