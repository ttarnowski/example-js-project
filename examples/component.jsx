import React, { useState } from "react";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import { CssBaseline, Container, TextField } from "@material-ui/core";
import Logo from "./Logo";
import PhonelinkSetup from "@material-ui/icons/PhonelinkSetup";

const useStyles2 = makeStyles((theme) =>
  createStyles({
    button: {
      margin: "0 auto 10px",
    },
    leftIcon: {
      marginRight: theme.spacing(1),
    },
    rightIcon: {
      marginLeft: theme.spacing(1),
    },
    iconSmall: {
      fontSize: 20,
    },
  })
);

const styles = {
  position: "fixed",
  //   top: "45%",
  left: "50%",
  marginLeft: "-185px",
  marginTop: "20px",
  //   marginTop: "-145px",
  textAlign: "center",
};

function LoadingPage({ children }) {
  return (
    <div style={styles}>
      <Logo width="120px" height="28px" productName="Lift" />
      {children}
    </div>
  );
}

const useStyles1 = makeStyles(
  createStyles({
    card: {
      minWidth: 320,
    },
    bullet: {
      display: "inline-block",
      margin: "0 2px",
      transform: "scale(0.8)",
    },
    title: {
      fontSize: 14,
    },
    pos: {
      marginBottom: 12,
    },
  })
);

function SimpleCard() {
  const classes = useStyles1();
  const bull = <span className={classes.bullet}>•</span>;

  return (
    <React.Fragment>
      <CssBaseline />
      <Container maxWidth="sm">
        <Card className={classes.card}>
          <CardContent>
            <Typography
              className={classes.title}
              color="textSecondary"
              gutterBottom
            >
              Welcome to the Lift Calling App.
            </Typography>
            <Typography
              className={classes.title}
              color="textSecondary"
              gutterBottom
            >
              Get on the lift and click / tap the button to go up.
            </Typography>
          </CardContent>
          <CardActions style={{ flexDirection: "column" }}>
            <Form />
          </CardActions>
        </Card>
      </Container>
    </React.Fragment>
  );
}

function Form() {
  const classes = useStyles2();
  const [disabled, setDisabled] = useState(false);
  const [message, setMessage] = useState("");
  const [password, setPassword] = useState("");

  const handleOnButtonClick = () => {
    setDisabled(true);
    setMessage("");
    fetch("/activate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password }),
    })
      .then((response) => {
        if (response.status == 202) {
          setMessage(
            "Lift has been called. It should take you up in a 5 seconds."
          );
          setTimeout(() => {
            setDisabled(false);
          }, 5000);
        } else if (response.status == 403) {
          setMessage("Error: Provided password is incorrect.");
          setDisabled(false);
        } else {
          setMessage(
            "There is a problem with a lift calling system. You need to take the other lift."
          );
        }
      })
      .catch((reason) => {
        console.log(reason);
        setMessage(
          "There is a problem with a lift calling system. You need to take the other lift."
        );
      });
  };

  return (
    <>
      <TextField
        label="Password"
        value={password}
        type="password"
        style={{ padding: "10px 0" }}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button
        variant="contained"
        color="primary"
        className={classes.button}
        onClick={handleOnButtonClick}
        disabled={disabled}
      >
        Take me up!
        <PhonelinkSetup className={classes.rightIcon} />
      </Button>
      <Typography
        variant="caption"
        style={{ color: message.includes("Error:") ? "red" : "green" }}
      >
        {message}
      </Typography>
    </>
  );
}

export default function () {
  return (
    <LoadingPage>
      <SimpleCard />
    </LoadingPage>
  );
}
