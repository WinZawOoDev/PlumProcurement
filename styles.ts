import { makeStyles } from "@rneui/themed";

export const useStyles = makeStyles((theme) => ({
    container: {
        flex: 1,
    },
    screenContainer: {
        flex: 1,
        flexDirection: 'column',
        padding: 5,
        backgroundColor: theme.colors.background,
    }
}));
