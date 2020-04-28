export function defaultPlotLayout(theme, title) {
    return {
        autosize: true,
        responsize: true,
        yaxis: {
            gridcolor: theme.palette.background.default,
            zerolinecolor: theme.palette.background.default,
            linecolor: theme.palette.background.default,
        },
        xaxis: {
            gridcolor: theme.palette.background.default,
            zerolinecolor: theme.palette.background.default,
            linecolor: theme.palette.background.default,
        },
        plot_bgcolor: theme.palette.background.paper,
        paper_bgcolor: theme.palette.background.paper,
        title: title,
        font: {
            color: theme.palette.text.primary
        }
    }
}

export function initialPlotState(layoutMemo) {
    return {
        layout: {...layoutMemo},
        frames: [],
        config: {}
    }
}