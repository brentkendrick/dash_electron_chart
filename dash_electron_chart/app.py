from dash import Dash, html, dcc
import plotly.express as px
import pandas as pd


# Sample data
df = pd.DataFrame(
    {
        "Fruit": ["Apples", "Oranges", "Bananas", "Grapes"],
        "Amount": [4, 1, 2, 5],
        "City": ["SF", "SF", "NYC", "NYC"],
    }
)

fig = px.bar(df, x="Fruit", y="Amount", color="City", barmode="group")

app = Dash(__name__)
app.layout = html.Div(
    children=[
        html.H1(children="Hello Dash"),
        html.Div(children="A simple web app with Dash."),
        dcc.Graph(id="example-graph", figure=fig),
    ]
)


if __name__ == "__main__":
    app.run(debug=False)
